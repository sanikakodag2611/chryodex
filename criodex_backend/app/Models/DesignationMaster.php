<?php 
 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DesignationMaster extends Model
{
    protected $table = 'designation_masters';  
    protected $fillable = [
        'designation_name',
        'designation_abbreviation',
        'company_id'
    ];
}
