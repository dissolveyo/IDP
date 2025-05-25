export const Container = ({ children, style = {} }) => {
    return (
        <div
            style={{
                maxWidth: 1200,
                margin: '0 auto',
                width: '100%',
                padding: '0 16px',
                ...style
            }}>
            {children}
        </div>
    );
};
