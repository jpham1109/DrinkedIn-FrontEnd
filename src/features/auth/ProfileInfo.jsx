import { useSelector } from 'react-redux'
import avatarDefault from '../../images/user-avatar.jpg'
import { selectCurrentUser } from './authSlice'

const ProfileInfo = () => {
	const currentUser = useSelector(selectCurrentUser)
	const {
		biography,
		instagram_account,
		insta_follower,
		insta_following,
		profile_pic,
	} = currentUser

	return (
		<div className="profile-info">
			{instagram_account ? (
				<div>
					<h3>Instagram</h3>
					<img src={profile_pic ?? avatarDefault} alt={instagram_account} />
					<p>{biography}</p>
					<p>
						Instagram followers: {insta_follower} | Instagram following:{' '}
						{insta_following}
					</p>
				</div>
			) : (
				<img
					src={profile_pic ? profile_pic : avatarDefault}
					alt="profile-pic"
				/>
			)}
			{/*bars ? (
                <div className="work_info">
                  <h5>Bartender at: {bars.name} </h5>
                  <img src={bars.photos[0]} alt={bars.name} />
                  <p>Address: {bars.address}</p>
                  <p>
                    {bars.rating} ⭐️ | {bars.total_ratings} reviews
                  </p>
                  
                </div>
              ) : null*/}
		</div>
	)
}

export default ProfileInfo
