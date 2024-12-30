import { Link } from 'react-router-dom'
import styles from './SlideInPanel.module.css'

const SlideInPanel = ({ isOpen, onClose, unauthorizedAction }) => {
	return (
		<>
			<div className={`${styles.panel} ${isOpen ? styles.panel__open : ''}`}>
				<div className={styles.panel__content}>
					<p>
						Please{' '}
						<Link to={`/login`}>
							<span>log in</span>
						</Link>{' '}
						or{' '}
						<Link to={`/signup`}>
							<span>sign up</span>
						</Link>
						{` `}
						to {unauthorizedAction},{' '}
						{`${unauthorizedAction === 'like' ? 'follow' : 'like'} `} and post
						cocktail recipes!
					</p>
				</div>
			</div>
			{isOpen ? <div className={styles.overlay} onClick={onClose} /> : null}
		</>
	)
}

export default SlideInPanel
