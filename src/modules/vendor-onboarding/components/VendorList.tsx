import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
  
interface Vendor {
  id: number;
  vendor_name?: string;
  mobile?: string;
  category?: string;
  status?: string | null;
}
  
interface VendorListProps {
  vendors: Vendor[];
  onView: (vendor: Vendor) => void;
}
  
function VendorList({ vendors, onView }: VendorListProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Vendor Name</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
  
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>{vendor.id}</TableCell>
              <TableCell>{vendor.vendor_name}</TableCell>
              <TableCell>{vendor.mobile}</TableCell>
              <TableCell>{vendor.category}</TableCell>
              <TableCell>{vendor.status || "pending"}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onView(vendor)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
  
export default VendorList;
