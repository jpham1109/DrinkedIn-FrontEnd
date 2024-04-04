import avatarDefault from '../../images/user-avatar.jpg'

const ProfileInfo = ({ currentUser }) => {
	const {
		biography,
		instagram_account,
		insta_follower,
		insta_following,
		avatar,
	} = currentUser

	return (
		<div className="profile-info">
			{instagram_account ? (
				<div>
					<h3>Instagram</h3>
					<img
						src={avatar ?? avatarDefault}
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
					src={avatar ? avatar : avatarDefault}
					alt="profile-pic"
					loading="lazy"
				/>
			)}
		</div>
	)
}

export default ProfileInfo
