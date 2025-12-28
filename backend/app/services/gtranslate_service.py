import googletrans


async def translateViToEn(txt):
    return await _translate(txt, "vi", "en")


async def translateEnToVi(txt):
    return await _translate(txt, "en", "vi")


async def _translate(txt, _src, _dest):
    res = ""
    async with googletrans.Translator() as translator:
        res = (await translator.translate(txt, src=_src, dest=_dest)).text
    return res
