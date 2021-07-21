import Review from "./Review";
import { useState } from "react";

export default function ReviewList ({reviews = []}) {
    const [reviewIndex, setReviewIndex] = useState(0)

    const reviewItems = reviews?.slice(reviewIndex, reviewIndex + 1).map((r) => 
        <Review key={r.author_name} review={r}/>
    )

    function handleClickMore () {
        setReviewIndex(reviewIndex => (reviewIndex + 1) % reviews.length)
    }
    return reviews ? (
        <div className="review-container">
            <div className="review-carousel">
                {reviewItems}
            </div>
        
            <button className="review-button more" onClick={handleClickMore}><i class="fas fa-chevron-right"></i></button>
        </div>
    ) : ""
}