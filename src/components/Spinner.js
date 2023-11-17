export const Spinner = ({ text = '', size = '5em '}) => {
    const header = text ? <h4>{text}</h4> : null
    return (
        <div className="spinner">
            {header}
            <div className="lds-ring" style={{width: size, height: size}}><div></div><div></div><div></div><div></div></div>
        </div>
    )
}