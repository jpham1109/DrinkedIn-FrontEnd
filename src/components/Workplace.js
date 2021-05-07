import PhotosContainer from "./PhotosContainer"
import ReviewList from "./ReviewList"

const Workplace = ({user}) => {
    const { work_at, workplace_photos, workplace_rating, workplace_reviews, workplace_ratings_total } = user

    return workplace_photos ? (
        <div className="workplace-container">
            <div className="workplace-header">
                <h2>{work_at}</h2>
                <p>{workplace_rating} ⭐️ | {workplace_ratings_total} reviews</p>
            </div>
            <div className="photo-container">
                <PhotosContainer photos={workplace_photos}/>
            </div>
            <div className="review-container">
                <ReviewList reviews={workplace_reviews}/> 
            </div>
        </div>
    ) : ""
}

export default Workplace
                
                
                
                
                