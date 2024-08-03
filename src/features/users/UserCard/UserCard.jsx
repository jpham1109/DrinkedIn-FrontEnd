import { useSelector } from 'react-redux'
import avatarDefault from '../../../images/user-avatar.jpg'
import { selectUserById } from '../usersSlice'
import React from 'react'
import styles from './UserCard.module.css'

const UserCard = ({ id }) => {
	const user = useSelector((state) => selectUserById(state, id)) ?? undefined
	const { full_name, username, avatar } = user ?? {}

	return user ? (
		<div className={styles.card}>
			<div className={styles.image}>
				<img
					className={styles.image__img}
					src={avatar ?? avatarDefault}
					alt={full_name ? full_name : username}
					loading="lazy"
				/>
			</div>
			<div className={styles.info}>
				<p>Name: {full_name} </p>
				<p>Username: {username} </p>
			</div>
		</div>
	) : (
		<div> Something is missing..</div>
	)
}

export default React.memo(UserCard)
