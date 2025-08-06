function Crosshair() {
    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Horizontal line */}
            <div
                style={{
                    position: 'absolute',
                    width: '20px',
                    height: '2px',
                    backgroundColor: 'white',
                    boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
                }}
            />

            {/* Vertical line */}
            <div
                style={{
                    position: 'absolute',
                    width: '2px',
                    height: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
                }}
            />

            {/* Center dot */}
            <div
                style={{
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
                }}
            />
        </div>
    );
}

export default Crosshair;
