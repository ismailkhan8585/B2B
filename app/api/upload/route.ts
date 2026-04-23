import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const UploadTypeSchema = z.enum([
  "avatar",
  "company-logo",
  "company-banner",
  "company-doc",
  "product",
  "rfq-attachment",
  "chat-file",
]);

const folderForType: Record<z.infer<typeof UploadTypeSchema>, string> = {
  avatar: "b2b/avatars",
  "company-logo": "b2b/company-logos",
  "company-banner": "b2b/company-banners",
  "company-doc": "b2b/company-docs",
  product: "b2b/products",
  "rfq-attachment": "b2b/rfq-attachments",
  "chat-file": "b2b/chat-files",
};

function isImage(mime: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mime);
}

function isDoc(mime: string) {
  return [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ].includes(mime);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const type = formData.get("type");

  const parsedType = UploadTypeSchema.safeParse(type);
  if (!parsedType.success) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  const size = file.size;

  const isDocType = parsedType.data === "company-doc" || parsedType.data === "rfq-attachment" || parsedType.data === "chat-file";
  const maxSize = isDocType ? 20 * 1024 * 1024 : 5 * 1024 * 1024;

  if (size > maxSize) {
    return NextResponse.json({ error: `File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)` }, { status: 400 });
  }

  if (!isDocType && !isImage(mime)) {
    return NextResponse.json({ error: "Only image files are allowed for this upload type" }, { status: 400 });
  }
  if (isDocType && !isDoc(mime)) {
    return NextResponse.json({ error: "Unsupported document type" }, { status: 400 });
  }

  try {
    const { url, publicId } = await uploadToCloudinary(file, folderForType[parsedType.data]);
    return NextResponse.json({ url, publicId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

