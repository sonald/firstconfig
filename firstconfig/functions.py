import os

def start_process(path, args = None):
    if args == None:
        args = [path]
    else:
        args = [path, args]

    child = os.fork()

    if not child:
        os.execvp(path, args)
        os._exit(1)

    return child
