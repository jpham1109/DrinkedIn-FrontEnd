import background from '../../images/bg3.jpeg'
import styles from './Home.module.css'

const Home = () => {
	return (
		<div className="home-page">
			<img
				className={styles.img}
				src={background}
				alt="background"
				loading="lazy"
			/>
		</div>
	)
}

export default Home
