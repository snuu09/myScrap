async (page) => {
  const raw = '/Users/andpeter/Desktop/ai_camp/myScrap/presentation/shots/_raw';
  const samples = '/Users/andpeter/Desktop/ai_camp/myScrap/presentation/shots/_samples';
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://mybrary-snuu09.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const composer = page.getByRole('textbox', { name: '스크랩 입력' });
  await composer.click();
  await composer.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await page.getByRole('button', { name: '분류하기' }).click();
  await page.waitForTimeout(8000);

  // draft with OG/thumbnail
  await page.screenshot({ path: `${raw}/desktop-draft-link.png`, type: 'png', scale: 'css' });

  // save video scrap
  const save = page.getByRole('button', { name: '저장' });
  if (await save.count()) {
    await save.first().click();
    await page.waitForTimeout(2500);
  }

  // open newest video if on shelf
  await page.goto('https://mybrary-snuu09.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const videoBtn = page.getByRole('button', { name: /Rick|영상|YouTube|Never/i }).first();
  if (await videoBtn.count()) {
    await videoBtn.click();
    await page.waitForTimeout(3000);
    // try reveal player
    const play = page.locator('video, iframe, [aria-label*="재생"], button:has-text("재생")').first();
    if (await play.count()) {
      try { await play.click({ timeout: 2000 }); } catch {}
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${raw}/desktop-detail-video.png`, type: 'png', scale: 'css' });
  }

  // PDF upload
  await page.goto('https://mybrary-snuu09.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const fileInputs = page.locator('input[type=file]');
  const n = await fileInputs.count();
  if (n) {
    await fileInputs.nth(0).setInputFiles(`${samples}/demo.pdf`);
    await page.waitForTimeout(2000);
    const classify = page.getByRole('button', { name: '분류하기' });
    if (await classify.isEnabled()) {
      await classify.click();
      await page.waitForTimeout(8000);
      const save2 = page.getByRole('button', { name: '저장' });
      if (await save2.count()) {
        await save2.first().click();
        await page.waitForTimeout(2500);
      }
    }
  }

  await page.goto('https://mybrary-snuu09.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const pdfBtn = page.getByRole('button', { name: /PDF|문서|Demo PDF|미리보기/i }).first();
  if (await pdfBtn.count()) {
    await pdfBtn.click();
    await page.waitForTimeout(2500);
    // open preview panel if collapsed
    const preview = page.getByRole('button', { name: /미리보기|문서|펼치/i }).first();
    if (await preview.count()) {
      try { await preview.click({ timeout: 1500 }); } catch {}
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${raw}/desktop-detail-pdf.png`, type: 'png', scale: 'css' });
  }

  // audio upload
  await page.goto('https://mybrary-snuu09.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const fileInputs2 = page.locator('input[type=file]');
  if (await fileInputs2.count()) {
    await fileInputs2.nth(0).setInputFiles(`${samples}/demo.wav`);
    await page.waitForTimeout(2000);
    const classify2 = page.getByRole('button', { name: '분류하기' });
    if (await classify2.isEnabled()) {
      await classify2.click();
      await page.waitForTimeout(8000);
      const save3 = page.getByRole('button', { name: '저장' });
      if (await save3.count()) {
        await save3.first().click();
        await page.waitForTimeout(2500);
      }
    }
  }

  await page.goto('https://mybrary-snuu09.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const audioBtn = page.getByRole('button', { name: /소리|오디오|wav|mp3|Demo/i }).first();
  if (await audioBtn.count()) {
    await audioBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${raw}/desktop-detail-audio.png`, type: 'png', scale: 'css' });
  }

  const fs = require('fs');
  const files = ['desktop-draft-link.png','desktop-detail-video.png','desktop-detail-pdf.png','desktop-detail-audio.png']
    .map((f) => ({ f, ok: fs.existsSync(`${raw}/${f}`), size: fs.existsSync(`${raw}/${f}`) ? fs.statSync(`${raw}/${f}`).size : 0 }));
  return { files, href: page.url() };
}
