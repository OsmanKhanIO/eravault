import React from 'react'
import ImageCard from './image-card'

// Temporary mock data to see how the grid looks
const MOCK_IMAGES = [
  { id: '1', name: 'Veer_Zaara_Poster_Original.jpg', size: '12.4 MB', date: 'Just now' },
  { id: '2', name: 'K3G_High_Res_Backdrop.png', size: '28.1 MB', date: '2 hours ago' },
  { id: '3', name: 'Dhoom_KeyArt_Master.psd', size: '145.0 MB', date: 'Yesterday' },
  { id: '4', name: 'Dil_Se_Cover_Raw.tiff', size: '84.2 MB', date: 'Oct 12' },
]

export default function ImageGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {MOCK_IMAGES.map((image) => (
        <ImageCard 
          key={image.id}
          name={image.name}
          size={image.size}
          date={image.date}
        />
      ))}
    </div>
  )
}