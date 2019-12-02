/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Table } from '@westpac/table';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Table striped>
				<caption>
					Table caption this table width is: <em>(100%)</em>
				</caption>
				<thead>
					<tr>
						<th scope="col">Column 1</th>
						<th scope="col">Column 2</th>
						<th scope="col">Column 3</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Cell 1</td>
						<td>Cell 7</td>
						<td>Cell 13</td>
					</tr>
					<tr>
						<td>Cell 2</td>
						<td>Cell 8</td>
						<td>Cell 14</td>
					</tr>
					<tr>
						<td className="table-highlight">Cell 3</td>
						<td>Cell 9</td>
						<td>Cell 15</td>
					</tr>
					<tr>
						<td>Cell 4</td>
						<td>Cell 10</td>
						<td className="table-highlight">Cell 16</td>
					</tr>
					<tr>
						<td>Cell 5</td>
						<td>Cell 11</td>
						<td>Cell 17</td>
					</tr>
					<tr>
						<td>Cell 6</td>
						<td>Cell 12</td>
						<td>Cell 18</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colSpan="3">Footer goes here and should colSpan all columns</td>
					</tr>
				</tfoot>
			</Table>
		</GEL>
	);
}

export default Example;
