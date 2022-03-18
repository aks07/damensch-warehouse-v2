import { useState, useRef, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import ClearBinAlert from './ClearBinAlert';
import ErrorPopup from './ErrorPopup';

const alertSound = require('./alert.mp3');

const dummyCsvFields = {
	vendor_code: 'VCDAM22',
	purchase_order_code: 'DA-20-21/135..',
	qty: '1',
	cartoncode: 'C001519-1',
};

const csvHeaders = [
	{ label: 'Sku Code', key: 'sku_code' },
	{ label: 'Sku Size', key: 'size' },
	{ label: 'Color', key: 'color' },
	{ label: 'Item Code', key: 'barcode' },
	{ label: 'Vendor Code', key: 'vendor_code' },
	{ label: 'Purchase Order Code', key: 'purchase_order_code' },
	{ label: 'Oty', key: 'qty' },
	{ label: 'cartoncode', key: 'cartoncode' },
];

const CSVDownload = (props) => {
	const btnRef = useRef(null);
	useEffect(() => btnRef.current?.click(), [btnRef]);
	return (
		<CSVLink {...props}>
			<span ref={btnRef} />
		</CSVLink>
	);
};

const Page2 = ({ setPage, itemCount, setItemCount }) => {
	const [loading, setLoading] = useState(false);
	const [scanItem, setScanItem] = useState('');
	const [download, setDownload] = useState({});
	const [errorMsg, setErrorMsg] = useState('');
	const [focusBarcodeInput, setFocusBarcodeInput] = useState(false);
	const [showClearBinAlert, setShowClearBinAlert] = useState(false);

	const tableNo = localStorage.getItem('tableNo');
	const skuCode = localStorage.getItem('skuCode');
	const binCode = localStorage.getItem('binCode');

	const handleChange = (e) => {
		// setDownload({});
		// setErrorMsg('');
		setScanItem(e.target.value);
	};

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			setLoading(true);
			setDownload({});
			setErrorMsg('');

			const data = {
				table: tableNo,
				bin: binCode,
				sku: skuCode,
				barcode: scanItem,
			};

			// const response = await fetch(
			// 	'https://api.recoder.damensch.com/process/dummy-success',
			// 	{
			// const response = await fetch(
			// 	'https://api.recoder.damensch.com/process/dummy-fail',
			// 	{
			const response = await fetch(
				'https://api.recoder.damensch.com/process/recode',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
				}
			);

			const jsonData = await response.json();
			console.log('JSON', jsonData);

            setItemCount({
                scanned: jsonData?.scan_count,
                print: jsonData?.print_count,
                fail: jsonData?.error_count,
            })
            
			if (jsonData.status === 'error') throw jsonData;

			jsonData.color = `"${jsonData.color}"`;
			console.log('**************************');
			console.log('JSON', { ...jsonData, ...dummyCsvFields });
			// console.log('dummy',dummyCsvFields )
			console.log('**************************');

			setDownload({ show: true, data: [{ ...jsonData, ...dummyCsvFields }] });

			// setItemCount({
			// 	scanned: jsonData?.num_scan,
			// 	print: jsonData?.num_print,
			// 	fail: jsonData?.num_failed,
			// });

            // setItemCount({
            //     scanned: jsonData?.scan_count,
            //     print: jsonData?.print_count,
            //     fail: jsonData?.error_count,
            // })
			// setFormData((state) => {
			// 	return {
			// 		...state,
			// 		scanItem: '',
			// 	};
			// });
		} catch (err) {
			console.log('FAIL!!', err);
			var audio = new Audio(alertSound);
			audio.play();
			setErrorMsg(err?.msg || 'Something went wrong!!');
		}
		setScanItem('');
		setLoading(false);
		setFocusBarcodeInput(true);
	};

	const handleClearBin = async () => {
		try {
			setLoading(true);
			const data = {
				table_code: tableNo,
				sku_code: skuCode,
				bin_code: binCode,
			};
			console.log('BIN CLEARED!!');
			/* ADD MAIN CODE */
			const response = await fetch(
				'https://api.recoder.damensch.com/process/end-session',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
				}
			);

			const jsonData = await response.json();
			console.log('JSON', jsonData);

            if(jsonData.status === 'error' || jsonData.statusCode == 500)
            throw jsonData

			// clear localStorage
			await localStorage.clear('tableNo');
			await localStorage.clear('skuCode');
			await localStorage.clear('binCode');

			// set page 1
			setPage(1);
		} catch (err) {
			console.log('ERRoR!!', err);
            //set err msg
            setErrorMsg(err?.msg || 'Clear Bin Failed!!')
		}
		setLoading(false);
		setShowClearBinAlert(false);
	};

	return (
		<div className='page-container'>
			{loading && <div className='loader'></div>}
			<div className='prefill'>
				<label>
					Table No.
					<span className='prefill-val'>{tableNo}</span>
				</label>
				<label>
					SKU Code
					<span className='prefill-val'>{skuCode}</span>
				</label>
				<label>
					Bin Code
					<span className='prefill-val'>{binCode}</span>
				</label>
			</div>

			{errorMsg ? (
				<ErrorPopup errorMsg={errorMsg} setErrorMsg={setErrorMsg} />
			) : (
				<form onSubmit={handleSubmit}>
					<label>
						Scan Item
						<input
							required
							autoFocus={focusBarcodeInput}
							type='text'
							value={scanItem}
							onChange={handleChange}
						/>
					</label>

					<input disabled={loading} type='submit' value='Enter' />
				</form>
			)}

			{download?.show && (
				<>
					<span className='success'>Success!! </span>
					{/* <CSVLink
              filename={`barcode_label_damensch_${new Date().getTime()}.csv`}
							data={download?.data}
							headers={csvHeaders}
							// onClick={() => {
							// 	setDownload(false);
							// }}
						>
							Download CSV
						</CSVLink> */}
					<CSVDownload
						data={download?.data}
						headers={csvHeaders}
						enclosingCharacter={``}
						filename={`barcode_lable_damensch_${new Date().getTime()}.csv`}
						target='_blank'
					/>
				</>
			)}
			<div className='item-data-container'>
				<div>Scanned Items: {itemCount.scanned || 0}</div>
				<div>Printed Items: {itemCount.print || 0}</div>
				<div>Error Items: {itemCount.fail || 0}</div>
			</div>
			{showClearBinAlert && (
				<ClearBinAlert
					handleClearBin={handleClearBin}
					setShowClearBinAlert={setShowClearBinAlert}
				/>
			)}
			<button
				className='clear-bin'
				onClick={() => {
					setShowClearBinAlert(true);
				}}
			>
				Clear Bin
			</button>
		</div>
	);
};

export default Page2;
