import React from 'react'

const UserCard = ({user}) => {
    return (
        <div className="user-card">
            <div className="user-card-img">
                <img  src={user.profile_pic} alt={user.instagram_account} />
            </div>
            <div className="user-card-info">
                <p>Name: {user.full_name} | Username: {user.username}</p>
                <p>Location: {user.location}</p>
                <p>Instagram: {user.instagram_account}</p>
                <p>Bio: {user.biography}</p>
                <p>Instagram followers: {user.insta_follower} | Instagram following: {user.insta_following}</p>
            </div>
        </div>
    )
}

export default UserCard
