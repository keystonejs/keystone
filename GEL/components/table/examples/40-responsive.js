/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Table } from '@westpac/table';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Standard</h2>
			<Table responsive>
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
					<tr className="table-highlight">
						<td>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</td>
						<td>Odit eligendi quasi quo nihil quia reiciendis obcaecati nostrum.</td>
						<td>Rem saepe eos, modi perferendis.</td>
					</tr>
					<tr>
						<td>Cell 3</td>
						<td>Cell 9</td>
						<td>Cell 15</td>
					</tr>
					<tr>
						<td>Cell 4</td>
						<td className="table-highlight">Cell 10</td>
						<td className="table-highlight">Cell 16</td>
					</tr>
					<tr>
						<td>Cell 5</td>
						<td>Cell 11</td>
						<td>Cell 17</td>
					</tr>
					<tr>
						<td className="table-highlight">Cell 6</td>
						<td className="table-highlight">Cell 12</td>
						<td className="table-highlight">Cell 18</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colSpan="3">Footer goes here and should colSpan all columns</td>
					</tr>
				</tfoot>
			</Table>

			<hr />

			<h2>Striped</h2>
			<Table striped responsive>
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
					<tr className="table-highlight">
						<td>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</td>
						<td>Odit eligendi quasi quo nihil quia reiciendis obcaecati nostrum.</td>
						<td>Rem saepe eos, modi perferendis.</td>
					</tr>
					<tr>
						<td>Cell 3</td>
						<td>Cell 9</td>
						<td>Cell 15</td>
					</tr>
					<tr>
						<td>Cell 4</td>
						<td className="table-highlight">Cell 10</td>
						<td className="table-highlight">Cell 16</td>
					</tr>
					<tr>
						<td>Cell 5</td>
						<td>Cell 11</td>
						<td>Cell 17</td>
					</tr>
					<tr>
						<td className="table-highlight">Cell 6</td>
						<td className="table-highlight">Cell 12</td>
						<td className="table-highlight">Cell 18</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colSpan="3">Footer goes here and should colSpan all columns</td>
					</tr>
				</tfoot>
			</Table>

			<hr />

			<h2>Bordered</h2>
			<Table bordered responsive>
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
					<tr className="table-highlight">
						<td>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</td>
						<td>Odit eligendi quasi quo nihil quia reiciendis obcaecati nostrum.</td>
						<td>Rem saepe eos, modi perferendis.</td>
					</tr>
					<tr>
						<td>Cell 3</td>
						<td>Cell 9</td>
						<td>Cell 15</td>
					</tr>
					<tr>
						<td>Cell 4</td>
						<td className="table-highlight">Cell 10</td>
						<td className="table-highlight">Cell 16</td>
					</tr>
					<tr>
						<td>Cell 5</td>
						<td>Cell 11</td>
						<td>Cell 17</td>
					</tr>
					<tr>
						<td className="table-highlight">Cell 6</td>
						<td className="table-highlight">Cell 12</td>
						<td className="table-highlight">Cell 18</td>
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
