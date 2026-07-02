<?php
$json = "valid.json";
chmod($json, 0664);
if (file_put_contents($json, file_get_contents('php://input'))){
   echo "Save Successful";
} else{
   echo "Save Failed";
}
?>