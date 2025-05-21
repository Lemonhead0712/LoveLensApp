"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button, Typography, Box, Paper, CircularProgress } from "@mui/material"
import { styled } from "@mui/material/styles"

const StyledDropzone = styled("div")({
  border: "2px dashed #cccccc",
  borderRadius: "4px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
  marginBottom: "20px",
})

const UploadForm = () => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    setErrorMessage(null) // Clear any previous error message
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrorMessage("Please select a file to upload.")
      return
    }

    setUploading(true)
    setErrorMessage(null) // Clear any previous error message

    try {
      // Simulate an upload process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate a successful upload
      console.log("Uploaded files:", files)
      setFiles([]) // Clear the files after successful upload
    } catch (error: any) {
      console.error("Upload failed:", error)
      setErrorMessage("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const thumbs = files.map((file) => (
    <Paper
      key={file.name}
      style={{
        display: "inline-flex",
        borderRadius: 2,
        border: "1px solid #eaeaea",
        marginBottom: 8,
        marginRight: 8,
        width: 100,
        height: 100,
        padding: 4,
        boxSizing: "border-box",
      }}
    >
      <Box
        style={{
          display: "flex",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={URL.createObjectURL(file) || "/placeholder.svg"}
          style={{
            display: "block",
            width: "auto",
            height: "100%",
          }}
          alt="Uploaded file preview"
        />
      </Box>
    </Paper>
  ))

  return (
    <Box>
      <StyledDropzone {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the files here ...</Typography>
        ) : (
          <Typography>Drag 'n' drop some files here, or click to select files</Typography>
        )}
      </StyledDropzone>
      <aside style={{ display: "flex", flexWrap: "wrap" }}>{thumbs}</aside>
      <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading}>
        {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
      </Button>
      {errorMessage && (
        <Typography color="error" mt={2}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  )
}

export default UploadForm
