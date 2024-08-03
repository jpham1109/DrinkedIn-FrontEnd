import background from '../../images/bg3.jpeg'
import appStyles from '../App/App.module.css'
import styles from './Home.module.css'

const Home = () => {
	return (
		<div className={styles.container}>
			<img
				className={appStyles.backgroundImage}
				src={background}
				alt="background"
				loading="lazy"
			/>
		</div>
	)
}

export default Home
