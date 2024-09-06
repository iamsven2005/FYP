//@ts-nocheck

import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import Busboy from 'busboy';

// Use the new API route segment config
export const runtime = 'nodejs'; // Ensure the API runs in a Node.js environment

export const POST = async (req: any): Promise<Response> => {
  try {
    return new Promise((resolve, reject) => {
      const busboy = new Busboy({ headers: req.headers });
      const fileChunks: Buffer[] = [];

      busboy.on('file', (fieldname, file) => {
        file.on('data', (data) => {
          fileChunks.push(data);
        });

        file.on('end', async () => {
          const buffer = Buffer.concat(fileChunks);

          try {
            const result = await Tesseract.recognize(buffer, 'eng', {
              logger: (m) => console.log(m), // Optional logging
            });

            resolve(
              NextResponse.json({ text: result.data.text }, { status: 200 })
            );
          } catch (error) {
            reject(
              NextResponse.json(
                { error: 'OCR processing failed' },
                { status: 500 }
              )
            );
          }
        });
      });

      busboy.on('finish', () => {
        console.log('Upload complete');
      });

      busboy.on('error', (err) => {
        reject(
          NextResponse.json(
            { error: 'Failed to process file' },
            { status: 500 }
          )
        );
      });

      req.pipe(busboy);
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
};
