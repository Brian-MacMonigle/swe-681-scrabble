import React from 'react';
import Styled from 'styled-components';

const TableWrapper = Styled.table`
	padding: 1em;
	margin: 1em;
`;

const TableBody = Styled.tbody`
`;

const HeaderRow = Styled.tr`
`;

const Header = Styled.th`
	border: 1px solid black;
	padding: 1em;
`;

const Row = Styled.tr`
`;

const Cell = Styled.td`
	border: 1px solid black;
	${props => props.css}
`;

function resolveAccessor(cell, accessor) {
	if(typeof accessor === 'string') {
		const accessors = accessor.split('.');
		return accessors.reduce((acc, access) => acc[access], cell);
	}
	if(typeof accessor === 'function') {
		return accessor(cell);
	}
	return null;
}

class Table extends React.Component {
	render() {
		const { 
			props: {
				headers = [],
				data = [],
			} = {},
		} = this;

		return (
			<TableWrapper>
				<TableBody>
					<HeaderRow>
						{headers.map((header, i) => (
							<Header 
								key={`table-header-${i}-${header.Header}`}
							>
								{header.Header}
							</Header>
						))}
					</HeaderRow>
					{data.map((cell, i) => (
						<Row
							key={`table-row-${i}-${cell.key || 'defaultKey'}`}
						>
							{headers.map((header, j) => (
								<Cell
									key={`table-row-cell-${i}-${j}-${cell.key || 'defaultKey'}`}
									css={header.css}
								>
									{resolveAccessor(cell, header.accessor)}
								</Cell>
							))}
						</Row>
					))}
				</TableBody>
			</TableWrapper>
		)
	}
}


export default Table;