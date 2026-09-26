-- 012: bersihkan data uji yang dibuat saat pengembangan 25 Sep 2026, sebelum mengambil
-- tangkapan layar BAB IV. JANGAN dijalankan tanpa persetujuan Hanif.
--
-- Yang dihapus (pratinjau 26 Sep 2026):
--   - 5 transaksi uji akun budi_santoso tanggal 25 Sep:
--       ZLC-20260925-U683 (Telkomsel 5.000), ZLC-20260925-LUM7 (Token PLN 20.000),
--       ZLC-20260925-6CHT (Silicone Phone Case), ZLC-20260925-M5BK (Mobile Legends 86 Diamonds),
--       ZLC-20260925-1FE8 (Token PLN 20.000 via Xendit)
--   - 3 pesanan Xendit uji budi_santoso (SUCCESS, FAILED, EXPIRED)
--   - provider 'telkomsel' (huruf kecil, id 8), duplikat tanpa produk
--   - ulasan uji aldi77 "Sudah beli, mantap!"
-- Yang dikembalikan: stok produk yang terpakai, dan saldo budi_santoso (+69.000 pembelian saldo,
-- −3.300 pengembalian pesanan gagal = +65.700, kembali ke 350.000).
-- Tidak disentuh: transaksi akun lain (monanurul, Hanif18, Yudis Ashura, dll.) dan akun testuser7468.

begin;

-- stok: satu unit per transaksi uji (Token PLN 20.000 terpakai dua kali)
update public.product p set stock = p.stock + x.n
from (select product_id, count(*) as n from public.transaction_history
      where transaction_id in ('ZLC-20260925-U683', 'ZLC-20260925-LUM7', 'ZLC-20260925-6CHT',
                               'ZLC-20260925-M5BK', 'ZLC-20260925-1FE8')
      group by product_id) x
where p.id = x.product_id;

delete from public.product_orders
where user_id = (select id from public.users where username = 'budi_santoso');

delete from public.transaction_history
where transaction_id in ('ZLC-20260925-U683', 'ZLC-20260925-LUM7', 'ZLC-20260925-6CHT',
                         'ZLC-20260925-M5BK', 'ZLC-20260925-1FE8');

update public.users set balance = balance + 65700 where username = 'budi_santoso';

delete from public.provider
where name = 'telkomsel' and not exists (select 1 from public.product where provider_id = 8) and id = 8;

delete from public.store_ratings
where user_id = (select id from public.users where username = 'aldi77') and comment = 'Sudah beli, mantap!';

-- periksa sebelum commit: budi harus 350000, tidak ada transaksi budi tanggal 25 Sep
select username, balance from public.users where username = 'budi_santoso';
select count(*) as sisa_transaksi_uji from public.transaction_history t join public.users u on u.id = t.purchaser
where u.username = 'budi_santoso' and t."timestamp" >= '2026-09-25';

commit;
