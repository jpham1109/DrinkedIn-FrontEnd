import PhotosContainer from "./PhotosContainer"
import ReviewList from "./ReviewList"

const Workplace = ({user}) => {
    const { work_at, workplace_photos, workplace_rating, workplace_reviews, workplace_ratings_total } = user

    return workplace_photos ? (
        <div>
            <h2>Bartend at {work_at}</h2>
            <PhotosContainer photos={workplace_photos}/>
            <p>{workplace_rating}</p>
            <p>{workplace_ratings_total}</p>
            <ReviewList reviews={workplace_reviews}/>
            
        </div>
    ) : ""
}

export default Workplace
                
                
                
                
                