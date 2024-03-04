
export default function Review ({review}) {
    const { author_name, profile_photo_url, rating, relative_time_description, text } = review
    return (
        <div className="review-card">
            <h3>{author_name}</h3>
            <img src={profile_photo_url} alt="avatar" />
            <span>{rating} | {relative_time_description}</span>
            <p>{text}</p>
        </div>
    )
}