import { makeStyles } from '@material-ui/core/styles';

const createClasses = makeStyles((theme) => ({
	root: {
		color: theme.palette.common.black,
	},
	exampleWithProps: (props) => ({
		'& svg': {
			width: '16px',
			height: '16px',
		},
		color: `${theme.palette[props.color].main} !important`,
	}),
}));

export default createClasses;
