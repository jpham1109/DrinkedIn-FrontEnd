import avatarDefault from '../../../images/user-avatar.jpg'
import styles from './ProfileInfo.module.css'

const ProfileInfo = ({ currentUser }) => {
	const {
		biography,
		instagram_account,
		insta_follower,
		insta_following,
		avatar,
		full_name,
		username,
		location,
		bartender,
	} = currentUser

	return (
		<div className={styles.container}>
			{instagram_account ? (
				<div>
					<h3>Instagram</h3>
					<img
						src={avatar ?? avatarDefault}
						alt={instagram_account}
						loading="lazy"
					/>
					<p>{biography}</p>
					<span>
						Instagram followers: {insta_follower} | Instagram following:{' '}
						{insta_following}
					</span>
				</div>
			) : (
				<div className={styles.wrapper}>
					<img
						src={avatar ? avatar : avatarDefault}
						alt="profile-pic"
						loading="lazy"
					/>
					<div className={styles.wrapper__info}>
						<p>
							<span>Name</span>: {full_name}
						</p>
						<p>
							<span>Username</span>: {username}
						</p>
						<p>
							<span>Location</span>: {location}
						</p>
						<p>{bartender ? 'Bartender ✅' : 'Not a bartender 🍻'}</p>
					</div>
				</div>
			)}
		</div>
	)
}

export default ProfileInfo
