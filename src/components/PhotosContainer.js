import { useState } from "react";

import Photo from "./Photo";

export default function PhotosContainer ({photos}) {
    const [photoIndex, setPhotoIndex] = useState(0)
    
    

    function handleClickMore (event) {
        console.log(event)
        setPhotoIndex(photoIndex => (photoIndex + 1) % photos.length)
    }
    return (
        <div className="cocktail-detail-3-photo">
            <div className="photo-carousel">
                {photos?.slice(photoIndex, photoIndex + 1).map((photo) =>
        <Photo onClick={handleClickMore} key={photo} photo={photo}/>
    )}
            </div>
            <button className="flight-button more" onClick={handleClickMore}><i class="fas fa-chevron-right"></i></button>
          
        </div>
    )
}