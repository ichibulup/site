"use client";

import { useState } from "react";
import { Dropzone as DR } from "@/components/io/dropzone";
import { useDemo } from "@/hooks/use-demo";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/element/dropzone'
import { Button } from "@/components/ui/button";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

export default function Page() {
  const [sendMessage] = useDemo();
  const [upload, setUpload] = useState()

  const demo = async () => {
    const response = await fetch('http://localhost:8080/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Hello from the web app!' }),
    });

    const data = await response.json();
    console.log('Response from /api/demo:', data);
  }

  return (
    <>
      <DR></DR>
      <FileUploadDemo/>
      Japtor
      <Button
        onClick={() => {
          sendMessage("Japtor");
        }}
      >
        Japtor
      </Button>
    </>
  );
}

const FileUploadDemo = () => {
  const props = useSupabaseUpload({
    bucketName: 'demo',
    path: 'demo',
    allowedMimeTypes: ['image/*'],
    maxFiles: 2,
    maxFileSize: 1000 * 1000 * 10, // 10MB,
  })
 
  return (
    <div className="w-[500px]">
      <Dropzone {...props}>
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  )
}
