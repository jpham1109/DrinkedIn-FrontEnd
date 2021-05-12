import { useState } from "react";

import Photo from "./Photo";

export default function PhotosContainer ({photos}) {
    const [photoIndex, setPhotoIndex] = useState(0)
    
    const photoItems = photos.slice(photoIndex, photoIndex + 1).map((photo) =>
        <Photo key={photo} photo={photo}/>
    )

    function handleClickMore () {
        setPhotoIndex(photoIndex => (photoIndex + 1) % photos.length)
    }
    return (
        <div className="cocktail-detail-3-photo">
            <div className="photo-carousel">
                {photoItems}
            </div>
           
            <button className="flight-button more" onClick={handleClickMore}><i class="fas fa-chevron-right"></i></button>
          
        </div>
    )
}