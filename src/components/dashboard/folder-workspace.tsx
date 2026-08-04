'use client'

import React from 'react'
import VaultTable from './vault-table'

type Asset = { id: string, filename: string, url: string, format: string, bytes: number, createdAt: Date }
type Folder = { id: string, name: string }

export default function FolderWorkspace({ 
  folderId, 
  initialAssets, 
  allFolders 
}: { 
  folderId: string, 
  initialAssets: Asset[], 
  allFolders: Folder[] 
}) {
  return (
    <div className="h-full w-full">
      <VaultTable 
        initialAssets={initialAssets} 
        folders={allFolders} 
        currentFolderId={folderId} 
      />
    </div>
  )
}