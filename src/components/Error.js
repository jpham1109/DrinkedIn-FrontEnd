export const Error = ({ children, ...props }) => {
    return (
        <div style={{color: 'red'}} {...props}>
            {children}
        </div>
    )
}