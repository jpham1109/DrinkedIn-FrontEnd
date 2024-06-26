import { useSelector } from 'react-redux'
import avatarDefault from '../../images/user-avatar.jpg'
import { selectUserById } from './usersSlice'
import React from 'react'

const UserCard = ({ id }) => {
	const user = useSelector((state) => selectUserById(state, id)) ?? undefined
	const { full_name, username, avatar } = user ?? {}

	return user ? (
		<div className="user-card">
			<div className="user-card-img">
				<img
					src={avatar ?? avatarDefault}
					alt={full_name ? full_name : username}
					loading="lazy"
				/>
			</div>
			<div className="user-card-info">
				<p>
					Name: {full_name} | Username: {username}
				</p>
			</div>
		</div>
	) : (
		<div> Something is missing..</div>
	)
}

export default React.memo(UserCard)
