import avatarDefault from '../../images/user-avatar.jpg'

const ProfileInfo = ({ currentUser }) => {
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
					<img
						src={profile_pic ?? avatarDefault}
						alt={instagram_account}
						loading="lazy"
					/>
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
					loading="lazy"
				/>
			)}
		</div>
	)
}

export default ProfileInfo
