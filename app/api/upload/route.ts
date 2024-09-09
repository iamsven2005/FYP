import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createReadStream, writeFile, mkdir } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Promisify necessary functions for async/await
const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);

export const config = {
  api: {
    bodyParser: false, // Disable body parsing
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse form data from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Define the uploads directory path
    const uploadDir = join(process.cwd(), 'uploads');

    // Ensure the directory exists, create it if not
    await mkdirAsync(uploadDir, { recursive: true });

    // Define the file path to save the uploaded file
    const tempFilePath = join(uploadDir, file.name);

    // Save the file to the local filesystem
    await writeFileAsync(tempFilePath, Buffer.from(await file.arrayBuffer()));

    // Upload the saved file to OpenAI (if necessary)
    const response = await openai.files.create({
      file: createReadStream(tempFilePath),
      purpose: 'fine-tune',
    });

    // Respond with success and the OpenAI file ID
    return NextResponse.json({ fileId: response.id, message: 'File uploaded successfully!' });
  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
