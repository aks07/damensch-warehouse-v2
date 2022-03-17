const ClearBinAlert = ({handleClearBin, setShowClearBinAlert}) => {
	return (
		<div id='myModal' className='modal'>
			<div className='modal-content'>
                <h2>Are You Sure You Want to clear this Bin</h2>
				<div className="button-container">
                    <button className="yes-button" onClick={handleClearBin}>Yes</button>
                    <button className="no-button" onClick={() => setShowClearBinAlert(false)}>No</button>
                </div>
			</div>
		</div>
	);
};

export default ClearBinAlert;
