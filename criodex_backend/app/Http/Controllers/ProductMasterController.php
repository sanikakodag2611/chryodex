<?php

namespace App\Http\Controllers;

use App\Models\ProductMaster;
use Illuminate\Http\Request;

class ProductMasterController extends Controller
{
    public function index()
    {
        $products = ProductMaster::all();
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_name' => 'required|string|unique:product_master,product_name|max:255',
            'code' => 'required|string|unique:product_master,code|max:50',
            'hsn_code' => 'required|string|unique:product_master,hsn_code|max:8',
            'price' => 'required|numeric',
            'tax_rate'=> 'required|numeric',
            'company_id' => 'required|integer|exists:company_masters,id',
        ]);

        $product = ProductMaster::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => $product
        ]);
    }

    public function show($id)
    {
        $product = ProductMaster::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
        'product_name' => 'required|string',
        'code' => 'required|string|unique:product_master,code,' . $id,
        'hsn_code' => 'required|string:max:8|unique:product_master,hsn_code,' . $id,
        'price' => 'required|numeric|min:0', 
        'tax_rate'=> 'required|numeric',
        'company_id' => 'required|integer|exists:company_masters,id',
    ]);
        $product = ProductMaster::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.'
            ]);
        }

        $product->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = ProductMaster::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.'
            ]);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.'
        ]);
    }
}
