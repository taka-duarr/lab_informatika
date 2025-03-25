<?php
namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Response;

class AdminController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|unique:admin,nama',
            'username' => 'required|string|unique:admin,username',
            'password' => 'nullable|string|min:6',
            'laboratorium_id' => 'nullable|exists:laboratorium,id'
        ]);

        try {
            $password = $validated['password'] ?? $validated['username'];
            Admin::create([
                'id' => Str::uuid(),
                'nama' => $validated['nama'],
                'username' => $validated['username'],
                'password' => Hash::make($password, ['rounds' => 12]),
                'laboratorium_id' => $validated['laboratorium_id']
            ]);

            return Response::json([
                'message' => 'Admin berhasil ditambahkan',
            ], 201);
        } catch (QueryException $exception) {
            return $this->queryExceptionResponse($exception);
        }
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:admin,id',
            'nama' => ['required', 'string', Rule::unique('admin', 'nama')->ignore($request->id)],
            'username' => ['required', 'string', Rule::unique('admin', 'username')->ignore($request->id)],
            'laboratorium_id' => 'nullable|exists:laboratorium,id'
        ]);

        try {
            Admin::where('id', $validated['id'])->update([
                'nama' => $validated['nama'],
                'username' => $validated['username'],
                'laboratorium_id' => $validated['laboratorium_id']
            ]);

            return Response::json([
                'message' => 'Admin berhasil diperbarui',
            ]);
        } catch (QueryException $exception) {
            return $this->queryExceptionResponse($exception);
        }
    }
    public function updatePassword(Request $request)
    {
        $authAdmin = Auth::guard('admin')->user();

        if (!$authAdmin || $authAdmin?->laboratorium_id !== null) {
            return Response::json([
                'message' => 'Hmm.. are we got a fighter?',
                'auth' => $authAdmin
            ], 403);
        }
        $validated = $request->validate([
            'id' => 'required|exists:admin,id',
            'password' => 'required|string|min:6',
            'repeat_password' => 'required|string|same:password',
        ]);

        try {
            Admin::where('id', $validated['id'])->update([
                'password' => Hash::make($validated['password'], ['rounds' => 12]),
            ]);

            return Response::json([
                'message' => 'Password Admin berhasil diperbarui',
            ]);
        } catch (QueryException $exception) {
            return $this->queryExceptionResponse($exception);
        }
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:admin,id',
        ]);
        try {
            Admin::where('id', $validated['id'])->delete();

            return Response::json([
                'message' => 'Admin berhasil dihapus'
            ]);
        } catch (QueryException $exception) {
            return $this->queryExceptionResponse($exception);
        }
    }

    public function uploadAvatar(Request $request)
    {
        $validated = $request->validate([
            'avatar' => 'required|file|mimes:jpg,jpeg,png|max:5120',
            'id' => 'required|exists:admin,id',
        ]);

        DB::beginTransaction();

        try {
            $admin = Admin::findOrFail($validated['id']);

            if ($admin->avatar) {
                Storage::disk('admin')->delete($admin->avatar);
            }

            $extension = $request->file('avatar')->getClientOriginalExtension();
            $randomString = Str::random(8);
            $filename = Str::slug($admin->nama . '-' . $randomString) . '.' . $extension;

            $avatarPath = $request->file('avatar')->storeAs('/', $filename, 'admin');
            $admin->update(['avatar' => $avatarPath]);

            DB::commit();

            return response()->json([
                'message' => 'Profil berhasil diunggah!',
                'avatar_url' => $avatarPath,
            ], 200);
        } catch (\Exception $exception) {
            DB::rollBack();

            if (isset($avatarPath)) {
                Storage::disk('admin')->delete($avatarPath);
            }

            return response()->json([
                'message' => config('app.debug') ? $exception->getMessage() : 'Gagal mengunggah avatar..',
            ], 500);
        }
    }

}
