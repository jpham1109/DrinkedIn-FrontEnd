const Workplace = ({ bar }) => {
	const { name, address, website } = bar

	return (
		<div className="cocktail-detail-3">
			<div className="cocktail-detail-3-header">
				<h2>{name}</h2>
				{address && <p>{address}</p>}
				{website && (
					<a target="_blank" rel="noreferrer" href={website}>
						website
					</a>
				)}
			</div>
		</div>
	)
}

export default Workplace
