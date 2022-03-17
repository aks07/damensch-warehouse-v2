import { useEffect, useState } from 'react';
import { Offline, Online } from 'react-detect-offline';

import './App.css';
import Page1 from './Page1';
import Page2 from './Page2';

function App() {
	const [page, setPage] = useState(1);
	const [itemCount, setItemCount] = useState({
		scanned: 0,
		print: 0,
		fail: 0,
	});

	return (
		<div className='App'>
			<Online>
				{page === 1 ? (
					<Page1 setItemCount={setItemCount} setPage={setPage} />
				) : (
					<Page2
						setPage={setPage}
						itemCount={itemCount}
						setItemCount={setItemCount}
					/>
				)}
			</Online>
			<Offline>
				<span className='offline'>
					You're offline right now. Check your connection.
				</span>
			</Offline>
		</div>
	);
}

export default App;
