import { useState } from 'react'
import avatarDefault from '../../../images/user-avatar.jpg'
import UpdateProfile from '../UpdateProfile/UpdateProfile'
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

	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleToggleModal = () => {
		setIsModalOpen((prev) => !prev)
		if (!isModalOpen) {
			document.body.style.overflow = 'hidden' // Prevent background scrolling when modal is open
			setTimeout(() => {
				document.getElementById('modalContent').focus() // Explicitly set focus to the modal content
			}, 100) // Allow some time for the modal to render
		} else {
			document.body.style.overflow = 'auto' // Restore background scrolling when modal is closed
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.container__detail}>
				{instagram_account ? (
					<>
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
					</>
				) : (
					<>
						<img
							src={avatar ? avatar : avatarDefault}
							alt="profile-pic"
							loading="lazy"
						/>
						<div className={styles.container__detail__info__wrapper}>
							<div className={styles.container__detail__info}>
								<span>Name: {full_name}</span>
								<span>Username: {username}</span>
								<span>Location: {location}</span>
								{bartender ? 'Bartender ✅' : 'Cocktail lover 🍻'}
							</div>
							<button className={styles.button} onClick={handleToggleModal}>
								{isModalOpen ? 'Updating...' : 'Update Profile'}
							</button>
						</div>
					</>
				)}
			</div>

			<div
				id="modalContent"
				tabIndex="-1"
				className={`${styles.modal} ${isModalOpen ? styles.active : ''}`}
			>
				<UpdateProfile
					currentUser={currentUser}
					handleToggleModal={handleToggleModal}
				/>
			</div>
		</div>
	)
}

export default ProfileInfo
