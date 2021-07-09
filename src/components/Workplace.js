import PhotosContainer from "./PhotosContainer"
import ReviewList from "./ReviewList"

const Workplace = ({user}) => {
    const { work_at, workplace_photos, workplace_rating, workplace_reviews, workplace_ratings_total, workplace_address } = user

    return workplace_photos ? (
        <div className="cocktail-detail-3">
            <PhotosContainer photos={workplace_photos}/>
            <div className="cocktail-detail-3-header">
                <h2>{work_at}</h2>
                <p>{workplace_address}</p>
                <p>{workplace_rating} ⭐️ | {workplace_ratings_total} reviews</p>
            </div>
            
            <ReviewList reviews={workplace_reviews}/> 
           
            {/* <div className="map-container"> */}
            {/* <div dangerouslySetInnerHTML={{ __html: " <iframe title='workplace' width='600' height='450' style='border:0' loading='lazy' src={'https://www.google.com/maps/embed/v1/place?q=place_id:' + workplace_id + '&key=' + process.env.REACT_APP_GM_KEY}></iframe>"}} /> */}
                {/* <iframe title="workplace" width="600" height="450" style="border:0" loading="lazy" allowfullscreen
                src={'https://www.google.com/maps/embed/v1/place?q=place_id:' + workplace_id + '&key=' + process.env.REACT_APP_GM_KEY}></iframe> */}
            {/* </div> */}
        </div>
    ) : ""
}

export default Workplace
                
                
                
                
                