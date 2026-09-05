-- Allow media up to 100MB (matches free-plan storage ceiling; large videos use TUS in the client).
update storage.buckets
set file_size_limit = 104857600
where id = 'scrap-media';
