/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Table } from '@westpac/table';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Table bordered striped>
				<caption>Interest paid monthly</caption>
				<thead>
					<tr>
						<th scope="col" className="col-sm-2">
							Term
						</th>
						<th scope="col" className="col-sm-2">
							$5,000 - $10,000
						</th>
						<th scope="col" className="col-sm-2">
							$10,000 - $20,000
						</th>
						<th scope="col" className="col-sm-2">
							$20,000 - $50,000
						</th>
						<th scope="col" className="col-sm-2">
							$50,000 - $100,000
						</th>
						<th scope="col" className="col-sm-2">
							$100,000 - $250,000
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th scope="row">1-2 months</th>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td className="table-highlight">2.55%</td>
						<td>2.55%</td>
					</tr>
					<tr>
						<th scope="row">2-3 months</th>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
					</tr>
					<tr className="table-highlight">
						<th scope="row">3-4 months</th>
						<td>3.45%</td>
						<td>3.45%</td>
						<td>3.45%</td>
						<td>3.45%</td>
						<td>3.45%</td>
					</tr>
					<tr className="table-highlight">
						<th scope="row">4-5 months</th>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
					</tr>
					<tr>
						<th scope="row">5-6 months</th>
						<td>3.45%</td>
						<td>3.45%</td>
						<td>3.45%</td>
						<td>3.45%</td>
						<td>3.45%</td>
					</tr>
					<tr>
						<th scope="row">6-7 months</th>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
					</tr>
					<tr>
						<th scope="row">7-8 months</th>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
					</tr>
					<tr>
						<th scope="row">8-9 months</th>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
						<td>2.55%</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colSpan="6">Footer goes here and should colSpan all columns</td>
					</tr>
				</tfoot>
			</Table>
		</GEL>
	);
}

export default Example;
