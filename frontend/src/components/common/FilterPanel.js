import { Paper, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

function FilterPanel() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <FormGroup>
        <FormControlLabel control={<Checkbox />} label="Category 1" />
        <FormControlLabel control={<Checkbox />} label="Category 2" />
        <FormControlLabel control={<Checkbox />} label="Category 3" />
      </FormGroup>
    </Paper>
  );
}

export default FilterPanel; 