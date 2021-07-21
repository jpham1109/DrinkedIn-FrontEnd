import PhotosContainer from "./PhotosContainer"
import ReviewList from "./ReviewList"

const Workplace = ({bar}) => {
   
    const { name, address, photos, rating, total_ratings, reviews } = bar
    return photos ? (
        <div className="cocktail-detail-3">
            <PhotosContainer photos={photos}/>
            <div className="cocktail-detail-3-header">
                <h2>{name}</h2>
                <p>{address}</p>
                <p>{rating} ⭐️ | {total_ratings} reviews</p>
            </div>
            
            <ReviewList reviews={reviews}/> 
           
            {/* <div className="map-container"> */}
            {/* <div dangerouslySetInnerHTML={{ __html: " <iframe title='workplace' width='600' height='450' style='border:0' loading='lazy' src={'https://www.google.com/maps/embed/v1/place?q=place_id:' + workplace_id + '&key=' + process.env.REACT_APP_GM_KEY}></iframe>"}} /> */}
                {/* <iframe title="workplace" width="600" height="450" style="border:0" loading="lazy" allowfullscreen
                src={'https://www.google.com/maps/embed/v1/place?q=place_id:' + workplace_id + '&key=' + process.env.REACT_APP_GM_KEY}></iframe> */}
            {/* </div> */}
        </div>
    ) : ""
}

export default Workplace
                
                
                
                
                