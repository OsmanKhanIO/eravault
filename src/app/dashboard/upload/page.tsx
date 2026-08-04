import UploadDropzone from "@/components/dashboard/upload-dropzone"

export default function UploadPage() {
  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2">Upload Images</h1>
        <p className="text-neutral-500 text-sm">Add high-quality media to your Imgbb vault.</p>
      </div>

      <UploadDropzone />
      
    </div>
  )
}