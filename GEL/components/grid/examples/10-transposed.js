/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Cell, Grid } from '@westpac/grid';
import { Box } from './_utils';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<Grid columns={5}>
				<Cell height={2}>
					<Box>1</Box>
				</Cell>
				<Cell>
					<Box>2</Box>
				</Cell>
				<Cell>
					<Box>3</Box>
				</Cell>
				<Cell height={6}>
					<Box>4</Box>
				</Cell>
				<Cell>
					<Box>5</Box>
				</Cell>
				<Cell>
					<Box>6</Box>
				</Cell>
				<Cell>
					<Box>7</Box>
				</Cell>
				<Cell>
					<Box>8</Box>
				</Cell>
				<Cell>
					<Box>9</Box>
				</Cell>
				<Cell>
					<Box>10</Box>
				</Cell>
				<Cell height={3}>
					<Box>11</Box>
				</Cell>
				<Cell>
					<Box>12</Box>
				</Cell>
				<Cell>
					<Box>13</Box>
				</Cell>
				<Cell>
					<Box>14</Box>
				</Cell>
				<Cell>
					<Box>15</Box>
				</Cell>
				<Cell>
					<Box>16</Box>
				</Cell>
				<Cell>
					<Box>17</Box>
				</Cell>
				<Cell>
					<Box>18</Box>
				</Cell>
				<Cell>
					<Box>19</Box>
				</Cell>
				<Cell>
					<Box>20</Box>
				</Cell>
				<Cell>
					<Box>21</Box>
				</Cell>
				<Cell>
					<Box>22</Box>
				</Cell>
				<Cell>
					<Box>23</Box>
				</Cell>
				<Cell>
					<Box>24</Box>
				</Cell>
			</Grid>
		</GEL>
	);
}

export default Example;
