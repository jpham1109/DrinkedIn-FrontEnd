import PhotosContainer from "./PhotosContainer"
import ReviewList from "./ReviewList"

const Workplace = ({user}) => {
    const { workplace_photos, workplace_rating, workplace_reviews, workplace_ratings_total } = user

    return workplace_photos ? (
        <div>
            <PhotosContainer photos={workplace_photos}/>
            <p>{workplace_rating}</p>
            <p>{workplace_ratings_total}</p>
            <ReviewList reviews={workplace_reviews}/>
            
        </div>
    ) : ""
}

export default Workplace
                
                
                
                
                