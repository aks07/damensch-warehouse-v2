import { useState } from 'react';

const initForm = {
	tableNo: localStorage.getItem('tableNo') || '',
	skuCode: localStorage.getItem('skuCode') || '',
	binCode: localStorage.getItem('binCode') || '',
};

const Page1 = ({setItemCount, setPage}) => {
	const [formData, setFormData] = useState(initForm);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const handleChange = (key, val) => {
		// setDownload({});
		setErrorMsg('');
		setFormData((state) => {
			return { ...state, [key]: val };
		});
	};

	const handleNextClick = async (e) => {
		try {
			e.preventDefault();
            setLoading(true);
            //################################################
            const data = {
                table_code: formData.tableNo,
                sku_code: formData.skuCode,
                bin_code: formData.binCode
            }
            const response = await fetch('https://api.recoder.damensch.com/process/start-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

            const jsonData = await response.json();
			console.log('JSON', jsonData);

            if(jsonData.status === 'error' || jsonData.statusCode == 500)
                throw jsonData

            //set itemCount
            setItemCount({
                scanned: jsonData?.scan_count,
                print: jsonData?.print_count,
                fail: jsonData?.error_count,
            })
            // ###################################################
			localStorage.setItem('tableNo', formData.tableNo);
			localStorage.setItem('skuCode', formData.skuCode);
			localStorage.setItem('binCode', formData.binCode);
            
            //setItemCount
            // setItemCount({
            //     scanned: 0,
            //     print: 0,
            //     fail: 0,
            // })


            setPage(2);
		} catch (err) {
			console.log('ERROR ON NEXT!!!!', err);
            //set err msg
            setErrorMsg(err?.msg || 'Incorrect Table number')
		}
        setLoading(false);
	};

	return (
		<div className='page-container'>
            {loading && <div className='loader'></div>}
			<form onSubmit={handleNextClick}>
				<label>
					Table No.
					<input
						required
						type='text'
						value={formData.tableNo}
						onChange={(e) => handleChange('tableNo', e.target.value)}
					/>
				</label>

				<label>
					SKU Code
					<input
						required
						type='text'
						value={formData.skuCode}
						onChange={(e) => handleChange('skuCode', e.target.value)}
					/>
				</label>
				<label>
					Bin Code
					<input
						required
						type='text'
						value={formData.binCode}
						onChange={(e) => handleChange('binCode', e.target.value)}
					/>
				</label>
				{errorMsg && <div className='error'>{errorMsg}</div>}

				<input disabled={loading} type='submit' value='Next' />
			</form>
		</div>
	);
};

export default Page1;
